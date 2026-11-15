import type { Lesson } from "../types";
import { basicTypes } from "./basic-types";
import { interfaces } from "./interfaces";
import { generics } from "./generics";
import { unions } from "./unions";
import { enumsTuples } from "./enums-tuples";
import { classes } from "./classes";
import { utilityTypes } from "./utility-types";
import { async } from "./async";

/** Thêm bài mới: tạo một file trong thư mục này rồi thêm vào mảng bên dưới. */
export const lessons: readonly Lesson[] = [
  basicTypes,
  interfaces,
  generics,
  unions,
  enumsTuples,
  classes,
  utilityTypes,
  async,
];
