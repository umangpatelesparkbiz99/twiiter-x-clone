import svgCaptcha, { type CaptchaObj } from "svg-captcha";

const generateNewCaptcha = () => {
  return svgCaptcha.create({
    size: 5,
    ignoreChars: "oOi1",
    noise: 1,
    color: true,
    background: "#524e70 ",
  });
};

export { generateNewCaptcha };
