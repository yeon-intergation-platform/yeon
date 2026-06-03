export interface YeonStructuredDataProps {
  id: string;
  data: unknown;
}

export function YeonStructuredData({ id, data }: YeonStructuredDataProps) {
  const serializedData = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script id={id} type="application/ld+json">
      {serializedData}
    </script>
  );
}
