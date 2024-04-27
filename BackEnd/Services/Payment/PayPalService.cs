using System.Text;
using Newtonsoft.Json.Linq;

public class PayPalService
{
    private readonly ILogger<PayPalService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public PayPalService(ILogger<PayPalService> logger, IConfiguration configuration, HttpClient httpClient)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task<string> GetPayPalAccessToken()
    {
        var clientId = _configuration["PayPal:ClientId"];
        var clientSecret = _configuration["PayPal:ClientSecret"];
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api-m.sandbox.paypal.com/v1/oauth2/token") {
            Headers = {
                { "Authorization", $"Basic {credentials}" }
            },
            Content = new FormUrlEncodedContent(new[] {
                new KeyValuePair<string, string>("grant_type", "client_credentials")
            })

        };
        _logger.LogInformation($"Request Headers: {request.Headers.ToString()}");
        
        try
        {
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation($"Response Content: {responseContent}");
            response.EnsureSuccessStatusCode();          
            var tokenJson = JObject.Parse(responseContent);
            var accessToken = tokenJson["access_token"].ToString();
            
            _logger.LogInformation($"Access Token: {accessToken}");
            return accessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching PayPal access token: {ex.Message}");
            return null;
        }
    }
}