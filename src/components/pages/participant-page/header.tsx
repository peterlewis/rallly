export const ParticipantPageHeader = (props: {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center p-3">
      {props.left ? (
        <div className="flex grow basis-0">{props.left}</div>
      ) : null}
      {props.center ? (
        <div className="flex grow basis-0 justify-center">{props.center}</div>
      ) : null}
      {props.right ? (
        <div className="flex grow basis-0 justify-end">{props.right}</div>
      ) : null}
    </div>
  );
};
