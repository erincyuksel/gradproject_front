export default {
  fileIsImage(fileName) {
    const splitFile = fileName.split(".");
    const fileExtension = splitFile[splitFile.length - 1];
    const validExtensions = ["jpg", "jpeg", "png", "avif"];
    if (validExtensions.indexOf(fileExtension) != -1) {
      return true;
    } else {
      return false;
    }
  },
  toHexString(byteArray) {
    return Array.prototype.map
      .call(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      })
      .join("");
  },
  toByteArray(hexString) {
    var result = [];
    for (var i = 0; i < hexString.length; i += 2) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
  },
};
