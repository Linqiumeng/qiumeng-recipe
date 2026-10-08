import mongoose from 'mongoose';
import { CATEGORY_NAMES, DIFFICULTIES } from '../../shared/categories.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, '用料名称不能为空'], trim: true },
    amount: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    text: { type: String, required: [true, '步骤内容不能为空'], trim: true },
    image: { type: String, default: '' },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, '菜名不能为空'], trim: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: [true, '请选择分类'],
      enum: { values: CATEGORY_NAMES, message: '分类「{VALUE}」不存在' },
    },
    summary: { type: String, trim: true, default: '' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    prepTime: { type: Number, min: 0 },
    servings: { type: Number, min: 1 },
    difficulty: { type: String, enum: DIFFICULTIES, default: '简单' },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    tips: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

// 允许用户修改的字段（slug、时间戳由系统维护）
export const EDITABLE_FIELDS = [
  'title', 'category', 'summary', 'coverImage', 'tags', 'prepTime',
  'servings', 'difficulty', 'ingredients', 'steps', 'tips',
];

export function pickEditable(obj = {}) {
  return Object.fromEntries(EDITABLE_FIELDS.filter((k) => k in obj).map((k) => [k, obj[k]]));
}

export default mongoose.models.Recipe ?? mongoose.model('Recipe', recipeSchema);
