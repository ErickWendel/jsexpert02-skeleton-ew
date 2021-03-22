class Util {
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
