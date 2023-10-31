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
};
