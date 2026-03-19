// c:\D\01-Projects\Agentdendrite\server\AgentdendriteServer\Controllers\ChatFeature\LlmController.cs
using AgentdendriteServer.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;
using IoFile = System.IO.File;

namespace AgentdendriteServer.Controllers.ChatFeature;

[Route("api/[controller]")]
[ApiController]
public class LlmController(LlmService chatService, JsonlStore jsonlStore) : ControllerBase
{

  [HttpPost("stream")]
  public async Task GetUniversalAiStream([FromBody] List<BasisMessage> msg, CancellationToken stopSign)
  {

    bool isHeaderWritten = false;      // 是否已写入 JSON 对象开头
    bool isReasoningFinished = false;  // 是否已从思考切换到正文
    string[] savePath = [ "Data", "ChatFeature", "chatData.jsonl" ];
    void AppendStreamChunk(BasisMessage chunk, bool isFinished)
    {
      // 尝试转换为 AssistantMessage
      AssistantMessage? assistantChunk = chunk as AssistantMessage;

      const string part1 = "{\"role\":\"assistant\",\"reasoning_content\":\"";
      const string part2 = "\",\"content\": \"";
      const string part3 = "\"}\n";

      // 核心逻辑拆分：
      // A. 如果是在传输中且转换失败（例如收到了非助手消息块），则跳过处理
      if (!isFinished && assistantChunk == null) return;

      // B. 如果有数据块，处理内容写入
      if (assistantChunk != null)
      {
        // 使用序列化工具处理转义字符
        // 安全提取 JSON 字符串内容的本地函数
        string GetSafeJsonInnerString(string? rawText)
        {
          if (string.IsNullOrEmpty(rawText)) return "";
          string jsonStr = rawText.ToJson();
          // ToJson 保证至少返回 '""' (长度为2)。安全截取掉头尾的1个双引号，保留内部完整的转义结构
          if (jsonStr.Length >= 2 && jsonStr.StartsWith('\"') && jsonStr.EndsWith('\"'))
          {
            return jsonStr[1..^1];
          }
          return jsonStr;
        }

        string reasoningText = GetSafeJsonInnerString(assistantChunk.ReasoningContent);
        string contentText = GetSafeJsonInnerString(assistantChunk.Content);



        // 分支一：处理思考内容 (Reasoning)
        if (!string.IsNullOrEmpty(reasoningText))
        {
          if (!isHeaderWritten)
          {
            jsonlStore.JsonStringSave(savePath, part1 + reasoningText, false);
            isHeaderWritten = true;
          }
          else
          {
            jsonlStore.JsonStringSave(savePath, reasoningText, false);
          }
        }

        // 分支二：处理正文内容 (Content)
        if (string.IsNullOrEmpty(reasoningText) && !string.IsNullOrEmpty(contentText))
        {
          if (!isHeaderWritten)
          {
            jsonlStore.JsonStringSave(savePath, part1 + part2 + contentText, false);
            isHeaderWritten = true;
            isReasoningFinished = true;
          }
          else if (!isReasoningFinished)
          {
            jsonlStore.JsonStringSave(savePath, part2 + contentText, false);
            isReasoningFinished = true;
          }
          else
          {
            jsonlStore.JsonStringSave(savePath, contentText, false);
          }
        }
      }

      // C. 分支三：结束处理（独立判断）
      if (isFinished)
      {

        // 如果只有思考开头而没有正文，必须闭合 JSON 结构中的 content 字段
        if (isHeaderWritten && !isReasoningFinished)
        {
          jsonlStore.JsonStringSave(savePath, part2, false);
        }

        // 只有在已经写入过开头的情况下，才写入结束符（防止空流产生无效 JSON）
        if (isHeaderWritten)
        {
          jsonlStore.JsonStringSave(savePath, part3, true);
        }
      }
    }

    

    Response.ContentType = "text/plain; charset=utf-8";

    List<BasisMessage> history = await jsonlStore.JsonLineReadAsync<BasisMessage>("Data", "ChatFeature", "chatData.jsonl");
    jsonlStore.JsonLineSave<BasisMessage>(msg, "Data", "ChatFeature", "chatData.jsonl");

    msg.InsertRange(0, history);

    try
    {
      var ff = Stopwatch.StartNew();
      await foreach (BasisMessage messageChunk in chatService.GetAiStreamAsync(msg, stopSign))
      {
        ff.Stop();
        long ms = ff.ElapsedMilliseconds;
        if (ms < 20) {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write($"{ms}ms "); // 快的并排写
        }
        else if (ms < 100) {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"\n[Timer] 网络返回中等耗时: {ms}ms");
        }
        else {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\n[Timer] 网络返回严重延迟: {ms}ms <<<<");
        }
        await Response.WriteAsync(messageChunk.Serialize() + "\n", stopSign);
        await Response.Body.FlushAsync(stopSign);

        AppendStreamChunk(messageChunk, false);
        ff = Stopwatch.StartNew();
      }
      ff.Stop();
      AppendStreamChunk(new AssistantMessage(), true);
    }
    catch (OperationCanceledException)
    {
    }
    catch (Exception ex)
    {
      await Response.WriteAsync($"[System Error]: {ex.Message}", stopSign);
    }
  }

  [HttpPost("full")]
  public async Task<ActionResult<BasisMessage>> GetFullResponse([FromBody] List<BasisMessage> msg, CancellationToken stopSign)
  {
    try
    {
      List<BasisMessage> history = await jsonlStore.JsonLineReadAsync<BasisMessage>("Data", "ChatFeature", "chatData.jsonl");

      // 保存
      jsonlStore.JsonLineSave<BasisMessage>(msg, "Data", "ChatFeature", "chatData.jsonl");

      msg.InsertRange(0, history);
      AssistantMessage result = await chatService.GetAiFullResponseAsync(msg, stopSign);

      // 保存
      jsonlStore.JsonLineSave<BasisMessage>([result], "Data", "ChatFeature", "chatData.jsonl");

      return result;
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"[System Error]: {ex.Message}");
    }
  }

  [HttpGet("clone")]
  public async Task<ActionResult<List<BasisMessage>>> ActionResult([FromQuery] string id = "chatData.jsonl")
  {
    return await jsonlStore.JsonLineReadAsync<BasisMessage>("Data", "ChatFeature", id);
  }
}
