function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function MarkdownText({ text = "" }) {
  const lines = String(text).split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    blocks.push(
      <ul key={`list-${blocks.length}`} className="ml-4 list-disc space-y-1">
        {listItems}
      </ul>
    );

    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      blocks.push(<div key={`blank-${index}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('- ')) {
      listItems.push(
        <li key={`li-${index}`} className="text-slate-100">
          {renderInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="whitespace-pre-wrap leading-7 text-slate-100">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <>{blocks}</>;
}
