import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const SpendingChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
          <p style={{
            fontSize: '1.2rem',
            color: '#777',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            No data available for chart.
          </p>
        );
      }
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#ccc" />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SpendingChart;
