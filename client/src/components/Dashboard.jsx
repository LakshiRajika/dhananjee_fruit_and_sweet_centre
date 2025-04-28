import RefundManagement from './RefundManagement';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'refunds':
        return <RefundManagement />;
      default:
        return <Overview />;
    }
  };
}