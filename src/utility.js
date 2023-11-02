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

  convertTimestamptoTime(end_time, cur_time) {
    var timeDifference = end_time - cur_time;
    var differenceDate = new Date(timeDifference);
    var diffHours = differenceDate.getUTCHours().toString().padStart(2, "0");
    var diffMinutes = differenceDate
      .getUTCMinutes()
      .toString()
      .padStart(2, "0");
    var diffSeconds = differenceDate
      .getUTCSeconds()
      .toString()
      .padStart(2, "0");
    return { hours: diffHours, minutes: diffMinutes, seconds: diffSeconds };
  },
};
