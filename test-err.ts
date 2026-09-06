const errorMsg = '{"error":{"code":429,"message":"You exceeded your current quota"}}';
let cleanErrorMsg = errorMsg;
try {
    const parsed = JSON.parse(errorMsg);
    if (parsed.error && parsed.error.message) {
        cleanErrorMsg = parsed.error.message;
    }
} catch(e) {}
console.log(typeof cleanErrorMsg, cleanErrorMsg);
console.log(cleanErrorMsg.includes("Quota exceeded"));
