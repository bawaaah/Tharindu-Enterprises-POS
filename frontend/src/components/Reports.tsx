import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Select, MenuItem, Alert, AppBar, Toolbar, IconButton
} from '@mui/material';
import { getReport } from '../services/api';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onLogout: () => void;
}

const Reports: React.FC<Props> = ({ onLogout }) => {
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await getReport(type, date);
      setReport(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch report');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>POS System</Typography>
          <Button color="inherit" href="/pos" sx={{ mr: 2 }}>
        POS
          </Button>
          <Button color="inherit" href="/products" sx={{ mr: 2 }}>
        Inventory
          </Button>
          <Button color="inherit" href="/reports" sx={{ mr: 2 }}>
        Report
          </Button>
          <IconButton color="inherit" onClick={onLogout}>
        <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>Sales Reports</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select value={type} onChange={(e) => setType(e.target.value as any)} fullWidth>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSubmit}>Generate Report</Button>
        </Box>
        {report && (
          <Box>
            <Typography variant="h6">
              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
            </Typography>
            <Typography>Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}</Typography>
            <Typography>Total Sales: ${report.totalSales}</Typography>
            <Typography>Transactions: {report.transactionCount}</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.itemsSold.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Reports;