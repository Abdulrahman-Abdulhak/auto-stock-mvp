type Props = {
  children: React.ReactNode;
};

function AppContainer({ children }: Props) {
  return <div className="max-w-7xl mx-auto">{children}</div>;
}

export default AppContainer;
