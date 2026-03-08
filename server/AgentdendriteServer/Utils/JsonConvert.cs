using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgentdendriteServer.Utils;

public static class JsonConvert
{
  // 静态配置实例：高性能且全局统一
  public static readonly JsonSerializerOptions Options = new()
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    PropertyNameCaseInsensitive = true // 反序列化时忽略大小写，更稳健
  };

  // 快捷序列化：对象 -> 字符串
  public static string ToJson<T>(this T obj) =>
      JsonSerializer.Serialize(obj, Options);

  // 快捷反序列化：字符串 -> 对象
  public static T? FromJson<T>(this string json) =>
      string.IsNullOrWhiteSpace(json) ? default : JsonSerializer.Deserialize<T>(json, Options);
}
