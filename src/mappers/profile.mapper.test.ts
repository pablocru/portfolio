import { describe, expect, test } from "vitest";
import { mapProfile } from "./profile.mapper";

const user = {
  login: "pablocru",
  name: "Pablo",
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "A bio",
};

describe("mapProfile", () => {
  test("keeps the trimmed name", () => {
    expect(mapProfile({ ...user, name: "  Pablo  " }).name).toBe("Pablo");
  });

  test.each([null, "", "   "])(
    "falls back to the login when the name is %j",
    (name) => {
      expect(mapProfile({ ...user, name }).name).toBe(user.login);
    },
  );

  test("keeps the trimmed bio", () => {
    expect(mapProfile({ ...user, bio: "  A bio  " }).bio).toBe("A bio");
  });

  test.each([null, "", "   "])("drops the bio when it is %j", (bio) => {
    expect(mapProfile({ ...user, bio }).bio).toBeNull();
  });
});
