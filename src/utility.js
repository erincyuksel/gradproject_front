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
    // Calculate the time difference in milliseconds
    const timeDifference = end_time - cur_time;

    // Calculate hours, minutes, and seconds
    let hours = Math.floor(timeDifference / 3600000); // 1 hour = 3600000 milliseconds
    let minutes = Math.floor((timeDifference % 3600000) / 60000); // 1 minute = 60000 milliseconds
    let seconds = Math.floor((timeDifference % 60000) / 1000); // 1 second = 1000 milliseconds

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    return { hours: hours, minutes: minutes, seconds: seconds };
  },

  didAuctionExpire(time1, time2) {
    if (time2 >= time1) return true;
    return false;
  },

  isHex(str) {
    if (!str) return false;
    if (str[0] == 0 && str[1] == "x") {
      return true;
    } else {
      return false;
    }
  },
  returnFormattedTime(unixTimestamp) {
    const date = new Date(Number(unixTimestamp)); // Convert seconds to milliseconds
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;

    return formattedDateTime;
  },
};
