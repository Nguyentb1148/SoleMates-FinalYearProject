using PayPalCheckoutSdk.Core;

namespace BackEnd.Services.Payment;

public class PayPalClient
{
    public static PayPalHttpClient GetPayPalClient()
    {
       
        var clientId = "AXMl8juZd5UdaMn3fqYuNTSH_NztoHa-mGVK0rlKY_lg6EnyIQE5_UA2osf0EwgVoyeNGMUNjYK6960QQ";
        var clientSecret = "EFttoTokBz_bjIXWnd7MJ7i2kvYMg1f9HEebwvbAPffpudoSPCzCJuP9dlxnsBOFW_EG97Ng5rZWbmhi";
        var environment = new SandboxEnvironment(clientId, clientSecret);
        var client = new PayPalHttpClient(environment);
        return client;
    }
}