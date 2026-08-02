export default function HierarchyTree({ title, items = [], selectedId = null, onSelect, emptyMessage = 'No items available.' }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h4>{title}</h4>
      </div>
      {items.length ? (
        <ul className="tree-list">
          {items.map((item) => (
            <li key={item.id} className={`tree-item ${selectedId === item.id ? 'selected' : ''}`}>
              <button type="button" className="tree-node" onClick={() => onSelect?.(item)}>
                <span>{item.name}</span>
                {item.code ? <small>{item.code}</small> : null}
              </button>
              {item.children?.length ? (
                <ul className="tree-list nested">
                  {item.children.map((child) => (
                    <li key={child.id} className={`tree-item ${selectedId === child.id ? 'selected' : ''}`}>
                      <button type="button" className="tree-node" onClick={() => onSelect?.(child)}>
                        <span>{child.name}</span>
                        {child.code ? <small>{child.code}</small> : null}
                      </button>
                      {child.children?.length ? (
                        <ul className="tree-list nested">
                          {child.children.map((grandChild) => (
                            <li key={grandChild.id} className={`tree-item ${selectedId === grandChild.id ? 'selected' : ''}`}>
                              <button type="button" className="tree-node" onClick={() => onSelect?.(grandChild)}>
                                <span>{grandChild.name}</span>
                                {grandChild.code ? <small>{grandChild.code}</small> : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="loading-card">{emptyMessage}</div>
      )}
    </div>
  )
}
