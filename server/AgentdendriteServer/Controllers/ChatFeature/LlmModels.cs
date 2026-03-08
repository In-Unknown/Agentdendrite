using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;

namespace AgentdendriteServer.Controllers.ChatFeature;

/// <summary>
/// 聊天参与者的角色定义。
/// 严格对应 OpenAI 协议中的 role 字段取值。
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MessageRole
{
  /// <summary> 用户（提问者） </summary>
  user,

  /// <summary> 助手（AI 模型） </summary>
  assistant,

  /// <summary> 系统提示词（用于设定模型行为） </summary>
  system
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "role")]
[JsonDerivedType(typeof(UserMessage), "user")]
[JsonDerivedType(typeof(AssistantMessage), "assistant")]
[JsonDerivedType(typeof(SystemMessage), "system")]
public class BasisMessage
{
  [JsonPropertyOrder(-3)]
  [JsonIgnore]
  public MessageRole Role { get; set; }

  /// <summary>
  /// 将当前片段序列化为 JSON 字符串。
  /// 常用于在 SSE (Server-Sent Events) 流中向前端写入数据行。
  /// </summary>
  /// <returns>符合小驼峰命名规范的 JSON 字符串</returns>
  public string Serialize()
  {
    return JsonConvert.ToJson<BasisMessage>(this);
  }
}

public class AssistantMessage : BasisMessage
{
  [JsonPropertyOrder(-2)]
  [JsonPropertyName("reasoning_content")]
  [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
  public string? ReasoningContent { get; set; } // 思考内容

  [JsonPropertyOrder(-1)]
  [JsonPropertyName("content")]
  [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
  public string? Content { get; set; }

  public AssistantMessage(string? content = null, string? reasoningContent = null)
  {
    Content = content;
    ReasoningContent = reasoningContent;
    Role = MessageRole.assistant;
  }
}

public class UserMessage : BasisMessage
{
  [JsonPropertyName("content")]
  public string Content { get; set; }

  public UserMessage(string content = "")
  {
    Content = content;
    Role = MessageRole.user; // 在构造函数中设置角色
  }
}

public class SystemMessage : BasisMessage
{
  [JsonPropertyName("content")]
  public string Content { get; set; }

  public SystemMessage(string content = "")
  {
    Content = content;
    Role = MessageRole.system; // 在构造函数中设置角色
  }
}
