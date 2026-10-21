import { describe, expect, test } from "vitest";
import { mapProfile } from "./profile.mapper";

const githubUser = {
  login: "pablocru",
  name: "Pablo",
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "A bio",
};

describe("mapProfile", () => {
  test("keeps the trimmed name", () => {
    expect(mapProfile({ ...githubUser, name: "  Pablo  " }).name).toBe("Pablo");
  });

  test.each([null, "", "   "])(
    "falls back to the login when the name is %j",
    (name) => {
      expect(mapProfile({ ...githubUser, name }).name).toBe(githubUser.login);
    },
  );

  test("keeps the trimmed bio", () => {
    expect(mapProfile({ ...githubUser, bio: "  A bio  " }).bio).toBe("A bio");
  });

  test.each([null, "", "   "])("drops the bio when it is %j", (bio) => {
    expect(mapProfile({ ...githubUser, bio }).bio).toBeNull();
  });
});
