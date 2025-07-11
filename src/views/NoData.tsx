type NoDataProps = {
  name?: string;
};

export default function NoData({ name = "Data" }: NoDataProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <span className="text-sm text-text-secondary">No {name}</span>
      </div>
    </div>
  );
}
