const env = {
  mode: process.env.NODE_ENV as "development" | "production",
  links: {
    resume: process.env.NEXT_PUBLIC_RESUME_LINK,
    cloudConvert: process.env.NEXT_PUBLIC_CLOUDCONVERT_URL,
  },
};

export default env;
