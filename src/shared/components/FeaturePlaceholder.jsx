export default function FeaturePlaceholder({ title, items }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>
      <div className="panel-body">
        <p>This module is scaffolded from the URMIS project structure and will be built next.</p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
