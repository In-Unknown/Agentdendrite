// c:\D\01-Projects\Agentdendrite\server\AgentdendriteServer\Controllers\ChatFeature\LlmService.cs
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace AgentdendriteServer.Controllers.ChatFeature;

/// <summary>
/// LLM (大语言模型) 通讯服务类。
/// 封装了基于 OpenAI 兼容协议（如 DeepSeek, GPT-4 等）的调用逻辑。
/// 支持推理过程（Thinking Process）的流式解析和结果聚合。
/// </summary>
public class LlmService(IConfiguration config, HttpClient httpClient)
{
  public async IAsyncEnumerable<AssistantMessage> GetAiStreamAsync(IEnumerable<BasisMessage> messages, [EnumeratorCancellation] CancellationToken ct)
  {
    // 1. 获取基础配置
    // 从 appsettings.json 或环境变量中读取模型连接信息
    string baseUrl = config["LLM:BaseUrl"] ?? throw new Exception("配置错误：缺失 LLM:BaseUrl");
    string apiKey = config["LLM:ApiKey"] ?? throw new Exception("配置错误：缺失 LLM:ApiKey");
    string modelName = config["LLM:ModelName"] ?? throw new Exception("配置错误：缺失 LLM:ModelName");

    // 2. 构造请求 Payload
    // 包含模型名称、上下文消息、开启流式传输，并启用思考过程（针对支持 DeepSeek 等模型的推理功能）
    var payload = new
    {
      model = modelName,
      messages,
      stream = true,
      thinking = new { type = "enabled" } // 兼容支持推理功能的 API 扩展
    };
    var request = new HttpRequestMessage(HttpMethod.Post, baseUrl);
    request.Headers.Add("Authorization", $"Bearer {apiKey}");
    request.Content = new StringContent(
        JsonConvert.ToJson(payload), 
        Encoding.UTF8,
        "application/json"
    );

    // 3. 发送网络请求
    // 使用 ResponseHeadersRead 确保我们能在响应体还没完全下载完时就开始处理流
    using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);

    // 处理 HTTP 错误状态码-里是有错的代码
    if (!response.IsSuccessStatusCode)
    {
      string errorDetail = await response.Content.ReadAsStringAsync(ct);
      yield return new AssistantMessage($"[API Error] ({response.StatusCode}): {errorDetail}");
      yield break;
    }

    // 4. 流式解析 SSE (Server-Sent Events)
    using Stream stream = await response.Content.ReadAsStreamAsync(ct);
    using StreamReader reader = new(stream);

    while (!reader.EndOfStream)
    {
      string? line = await reader.ReadLineAsync(ct);

      // 过滤空行或非 data 协议行
      if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data:")) continue;

      // 获取 data: 之后的内容
      string data = line[5..].Trim();

      // 检查流是否结束
      if (data == "[DONE]") yield break;

      string? thinking = null;
      string? answer = null;

      try
      {
        using JsonDocument doc = JsonDocument.Parse(data);
        // 按照 OpenAI 标准格式解析 choices[0].delta
        JsonElement delta = doc.RootElement.GetProperty("choices")[0].GetProperty("delta");

        // 处理推理内容 (Thinking/Reasoning)
        // 某些模型使用 reasoning_content 字段返回思考过程
        if (delta.TryGetProperty("reasoning_content", out var reasoning) && reasoning.ValueKind != JsonValueKind.Null)
        {
          thinking = reasoning.GetString() ?? "";
        }

        // 处理正式文本内容 (Content)
        if (delta.TryGetProperty("content", out var content) && content.ValueKind != JsonValueKind.Null)
        {
          answer = content.GetString() ?? "";
        }
      }
      catch
      {
        // 解析失败（可能是非标准 JSON 片段），跳过该行继续处理
        continue;
      }


      // 组装最后返回的内容
      yield return new AssistantMessage(answer, thinking);
    }
  }

  public async Task<AssistantMessage> GetAiFullResponseAsync(IEnumerable<BasisMessage> messages, CancellationToken ct)
  {
    var reasoningBuilder = new StringBuilder();
    var contentBuilder = new StringBuilder();

    // 异步迭代流式输出，将片段拼接到 StringBuilder 中
    await foreach (var message in GetAiStreamAsync(messages, ct))
    {
      if (!string.IsNullOrEmpty(message.Content))
      {
        contentBuilder.Append(message.Content);
      }
      else if (!string.IsNullOrEmpty(message.ReasoningContent))
      {
        reasoningBuilder.Append(message.ReasoningContent);
      }
    }
    
    // 4. 将拼接好的字符串转回 string，如果没有内容则转为 null
    string? finalContent = contentBuilder.Length > 0 ? contentBuilder.ToString() : null;
    string? finalReasoning = reasoningBuilder.Length > 0 ? reasoningBuilder.ToString() : null;

    // 5. 返回合并后的新对象
    return new AssistantMessage(finalContent, finalReasoning);
  }
}
