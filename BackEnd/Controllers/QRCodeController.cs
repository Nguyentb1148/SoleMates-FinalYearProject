using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class QRCodeController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetQRCode(string data)
        {
            using (var qrGenerator = new QRCodeGenerator())
            {
                var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
                using (var qrCode = new QRCode(qrCodeData))
                {
                    using (var bitmap = qrCode.GetGraphic(20))
                    {
                        using (var stream = new MemoryStream())
                        {
                            bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                            stream.Position = 0;
                            return File(stream.ToArray(), "image/png");
                        }
                    }
                }
            }
        }
    }
}