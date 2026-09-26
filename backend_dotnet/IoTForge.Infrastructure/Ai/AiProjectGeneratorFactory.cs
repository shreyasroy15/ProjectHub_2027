using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;
using IoTForge.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IoTForge.Infrastructure.Ai;

public class AiProjectGeneratorFactory : IAiProjectGenerator
{
    private readonly IConfiguration _config;
    private readonly ILogger<AiProjectGeneratorFactory> _logger;
    private readonly RuleBasedEngineeringEngine _fallbackEngine;
    private readonly HttpClient _httpClient;

    public AiProjectGeneratorFactory(IConfiguration config, ILogger<AiProjectGeneratorFactory> logger, HttpClient httpClient)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClient;
        _fallbackEngine = new RuleBasedEngineeringEngine();
    }

    public string ProviderName
    {
        get
        {
            var provider = _config["AI_PROVIDER"] ?? "DeterministicHardwareEngine";
            var apiKey = _config["AI_API_KEY"];
            return string.IsNullOrEmpty(apiKey) ? $"{provider} (Offline Mode)" : provider;
        }
    }

    public async Task<StructuredProjectOutput> GenerateProjectAsync(ProjectGenerationRequest request, CancellationToken cancellationToken = default)
    {
        var provider = _config["AI_PROVIDER"]?.ToLowerInvariant();
        var apiKey = _config["AI_API_KEY"];
        var model = _config["AI_MODEL"] ?? "gpt-4o-mini";

        if (string.IsNullOrWhiteSpace(apiKey) || (provider != "openai" && provider != "gemini" && provider != "anthropic"))
        {
            _logger.LogInformation("No external AI API key provided or provider is '{Provider}'. Using deterministic Hardware Synthesis Engine.", provider ?? "Default");
            return await _fallbackEngine.GenerateProjectAsync(request, cancellationToken);
        }

        try
        {
            if (provider == "openai")
            {
                var result = await CallOpenAiAsync(request, apiKey, model, cancellationToken);
                if (result != null && !string.IsNullOrEmpty(result.Project.Name))
                {
                    return result;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "External AI Provider call failed. Falling back to deterministic Hardware Synthesis Engine.");
        }

        return await _fallbackEngine.GenerateProjectAsync(request, cancellationToken);
    }

    public async Task<ProjectChatResponse> ChatWithProjectAsync(Project project, string userMessage, CancellationToken cancellationToken = default)
    {
        return await _fallbackEngine.ChatWithProjectAsync(project, userMessage, cancellationToken);
    }

    public async Task<CodeSpecDto> RegenerateCodeAsync(Project project, string targetStack, string subCategory, CancellationToken cancellationToken = default)
    {
        return await _fallbackEngine.RegenerateCodeAsync(project, targetStack, subCategory, cancellationToken);
    }

    private async Task<StructuredProjectOutput?> CallOpenAiAsync(ProjectGenerationRequest request, string apiKey, string model, CancellationToken cancellationToken)
    {
        var systemPrompt = @"You are a master IoT hardware engineer, embedded software architect, and electrical safety reviewer.
Given the user's IoT concept, output a complete, valid JSON object matching this schema:
{
  ""project"": { ""name"": """", ""description"": """", ""difficulty"": """", ""estimatedCost"": 0.0, ""estimatedBuildTime"": """", ""controller"": """", ""connectivity"": """", ""powerSource"": """", ""safetyReviewRequired"": false, ""safetyReviewReason"": null },
  ""requirements"": [ """" ],
  ""components"": [ { ""name"": """", ""category"": """", ""description"": """", ""quantity"": 1, ""estimatedPrice"": 0.0, ""vendorName"": """", ""purchaseUrl"": """", ""specifications"": {}, ""pinout"": [ { ""pin"": """", ""function"": """", ""voltage"": """", ""type"": """" } ] } ],
  ""connections"": [ { ""fromComponent"": """", ""fromPin"": """", ""toComponent"": """", ""toPin"": """", ""signal"": """", ""wireColor"": """", ""voltage"": """", ""description"": """" } ],
  ""architecture"": { ""nodes"": [ { ""id"": """", ""label"": """", ""type"": """", ""layer"": """", ""description"": """", ""x"": 0, ""y"": 0 } ], ""connections"": [ { ""from"": """", ""to"": """", ""protocol"": """", ""description"": """" } ] },
  ""infrastructure"": { ""hardware"": """", ""network"": """", ""cloud"": """", ""backend"": """", ""database"": """", ""security"": """", ""monitoring"": """", ""backups"": """" },
  ""firmware"": [ { ""targetStack"": ""Firmware"", ""subCategory"": ""Arduino"", ""fileName"": ""main.cpp"", ""language"": ""cpp"", ""codeContent"": """", ""description"": """" } ],
  ""backend"": [ { ""targetStack"": ""Backend"", ""subCategory"": ""ASPNET"", ""fileName"": ""TelemetryController.cs"", ""language"": ""csharp"", ""codeContent"": """", ""description"": """" } ],
  ""database"": { ""targetStack"": ""Database"", ""subCategory"": ""PostgreSQL"", ""fileName"": ""schema.sql"", ""language"": ""sql"", ""codeContent"": """", ""description"": """" },
  ""buildSteps"": [ { ""stepNumber"": 1, ""title"": """", ""description"": """", ""requiredComponents"": [ """" ], ""warnings"": """", ""expectedResult"": """" } ],
  ""testingChecklist"": [ { ""category"": ""Hardware"", ""title"": """", ""description"": """", ""status"": ""Pending"" } ],
  ""safetyWarnings"": [ { ""severity"": ""High"", ""title"": """", ""warning"": """", ""remedy"": """" } ],
  ""clarificationQuestions"": []
}
Output strictly valid JSON and nothing else.";

        var payload = new
        {
            model = model,
            response_format = new { type = "json_object" },
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = $"User IoT Idea: {request.Prompt}\nPreferred Controller: {request.PreferredController ?? "ESP32"}" }
            }
        };

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(json);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        if (string.IsNullOrEmpty(content)) return null;

        return JsonSerializer.Deserialize<StructuredProjectOutput>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}
