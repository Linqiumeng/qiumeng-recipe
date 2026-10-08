import { CoverImage } from './RecipeCard.jsx';
import { imageUrl } from '../lib/image.js';
import { useOrder } from '../lib/OrderContext.jsx';

export default function RecipeDetail({ recipe }) {
  const order = useOrder();
  const ordered = order.has(recipe.slug);

  const facts = [
    recipe.prepTime > 0 && ['用时', `${recipe.prepTime}′`],
    recipe.servings > 0 && ['份量', `${recipe.servings} 人`],
    recipe.difficulty && ['难度', recipe.difficulty],
  ].filter(Boolean);

  return (
    <article className="detail">
      <CoverImage recipe={recipe} preset="detail" className="detail-cover" />

      <header className="detail-header">
        <span className="pill pill-accent">{recipe.category}</span>
        <h1>{recipe.title}</h1>
        {recipe.summary && <p className="detail-summary">{recipe.summary}</p>}
        {recipe.tags?.length > 0 && (
          <div className="tags">
            {recipe.tags.map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </header>

      {facts.length > 0 && (
        <div className="facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <b>{value}</b>
              {label}
            </div>
          ))}
        </div>
      )}

      {recipe.ingredients?.length > 0 && (
        <section>
          <h2>🧺 准备这些</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.name}
                {ing.amount && <small>{ing.amount}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps?.length > 0 && (
        <section>
          <h2>👩‍🍳 跟着做</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>
                <p>{step.text}</p>
                {step.image && <img src={imageUrl(step.image, 'step')} alt={`步骤 ${i + 1}`} loading="lazy" />}
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.tips && <p className="tips">💡 {recipe.tips}</p>}

      <button type="button" className={`cta ${ordered ? 'is-on' : ''}`} onClick={() => order.toggle(recipe)}>
        {ordered ? '✓ 已经加进点菜单啦（点击移除）' : '♡ 我想吃这个'}
      </button>
    </article>
  );
}
