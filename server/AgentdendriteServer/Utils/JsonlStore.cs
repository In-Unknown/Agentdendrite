using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace AgentdendriteServer.Utils;

public class JsonlStore
{
  // 用于流式写入的共享写入器（注意：此服务为 Scoped，每个请求独立，故安全）
  private StreamWriter? _currentWriter;

  public async Task<List<T>> JsonLineReadAsync<T>(params string[] pathParts)
  {
    string fullPath = Path.Combine([AppDomain.CurrentDomain.BaseDirectory, .. pathParts]);
    var result = new List<T>();

    if (!File.Exists(fullPath))
      return result;

    using var reader = new StreamReader(fullPath);
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
      if (string.IsNullOrWhiteSpace(line)) continue;
      try
      {
        T? item = JsonSerializer.Deserialize<T>(line, JsonConvert.Options);
        if (item != null) result.Add(item);
      }
      catch (JsonException ex)
      {
        Debug.WriteLine($"[JsonlStore.JsonLineReadAsync] 解析文件 JSON 行时出错: {ex.Message}");
        continue;
      }
    }
    return result;
  }

  public void JsonLineSave<T>(IEnumerable<T> items, params string[] pathParts)
  {
    if (items == null || !items.Any()) return;

    string baseDir = AppDomain.CurrentDomain.BaseDirectory;
    string fullPath = Path.Combine([baseDir, .. pathParts]);

    Debug.WriteLine($"JsonLineSave: Full path = {fullPath}");

    string? directory = Path.GetDirectoryName(fullPath);
    if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
    {
      Directory.CreateDirectory(directory);
      Debug.WriteLine($"JsonLineSave: Created directory: {directory}");
    }

    try
    {
      int count = 0;
      using var writer = new StreamWriter(fullPath, append: true, Encoding.UTF8);
      foreach (T item in items)
      {
        writer.WriteLine(JsonConvert.ToJson(item));
        count++;
      }
      Debug.WriteLine($"JsonLineSave: Successfully wrote {count} lines to {fullPath}");
    }
    catch (Exception ex)
    {
      Debug.WriteLine($"JsonlStore.JsonLineSave: ERROR - {ex.Message}");
      Debug.WriteLine(ex.StackTrace);
      throw;
    }
  }

  /// <summary>
  /// 将原始字符串内容追加写入到指定文件（用于流式逐块写入）。
  /// </summary>
  public void JsonStringSave(string[] pathParts, string content, bool closeFile = false)
  {
    if (pathParts == null || pathParts.Length == 0) return;

    // 1. 拼接完整路径
    string fullPath = Path.Combine([AppDomain.CurrentDomain.BaseDirectory, .. pathParts]);

    // 2. 获取当前正在写入的文件路径（如果流是打开的）
    string? currentOpenPath = (_currentWriter?.BaseStream as FileStream)?.Name;

    // 3. 判断是否需要重新创建 StreamWriter
    // 条件：当前没有打开的流，或者要写入的路径和正在打开的路径不一致
    if (_currentWriter == null || !string.Equals(currentOpenPath, fullPath, StringComparison.OrdinalIgnoreCase))
    {
      // 关掉旧的（如果有）
      _currentWriter?.Dispose();

      // 确保目录存在，防止异常报错
      string? dir = Path.GetDirectoryName(fullPath);
      if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
      {
        Directory.CreateDirectory(dir);
      }

      // 打开新的流
      _currentWriter = new StreamWriter(fullPath, append: true, Encoding.UTF8);
      Debug.WriteLine($"JsonLineSave(stream): Opened new writer for {fullPath}");
    }

    // 4. 写入内容
    _currentWriter.Write(content);
    _currentWriter.Flush();

    // 5. 如果要求关闭文件，则释放资源并置空
    if (closeFile)
    {
      _currentWriter.Dispose();
      _currentWriter = null;
      Debug.WriteLine("JsonLineSave(stream): Closed file.");
    }
  }
}
