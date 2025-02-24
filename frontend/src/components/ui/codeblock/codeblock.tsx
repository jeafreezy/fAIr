const CodeBlock = ({ content }: { content: string }) => {
  return (
    <div className="h-60 w-full overflow-x-auto bg-dark p-2">
      <pre className="text-xs text-light-gray">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
