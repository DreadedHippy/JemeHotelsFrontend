export interface PaymentInitialize {
  bookingId: string;
}

export interface PaymentInitializeResponse {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentVerifyResponse {
  status: string;
  reference: string;
}



// public class PaystackInitializeData
//  {
//      [JsonPropertyName("authorization_url")] public string AuthorizationUrl { get; set; } = default!;
//      [JsonPropertyName("access_code")] public string AccessCode { get; set; } = default!;
//      [JsonPropertyName("reference")] public string Reference { get; set; } = default!;
//  }
