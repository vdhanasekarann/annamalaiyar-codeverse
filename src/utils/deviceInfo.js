export function detectOS(){
 const ua=navigator.userAgent;
 if(/android/i.test(ua)) return "Android";
 if(/iphone|ipad/i.test(ua)) return "iOS";
 if(/windows/i.test(ua)) return "Windows";
 if(/mac/i.test(ua)) return "Mac";
 return "Unknown";
}