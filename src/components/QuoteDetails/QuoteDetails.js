import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ComponentCard from '../ComponentCard/ComponentCard';
import ExportQuotesModal from './ExportQuotesModal';
import jwt_decode from 'jwt-decode';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import './QuoteDetails.css';

const QuoteDetails = () => {
  const [records, setRecords] = useState([]);
  const [quoteUserId, setQuoteUserId] = useState('');
  const [name, setName] = useState('');
  const [quoteType, setQuoteType] = useState('Gaming PC');
  const [quoteType2, setQuoteType2] = useState('Gaming PC');
  const [quoteDate, setQuoteDate] = useState('');
  const [quoteCost, setQuoteCost] = useState(0);
  const [quoteComps, setQuoteComps] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const isAdmin = localStorage.getItem('Admin') === 'admin';


  const token = localStorage.getItem('token');
  const decodedToken = jwt_decode(token);
  const userId = decodedToken.userId;



  useEffect(() => {
    const fetchRecords = async () => {
      setQuoteUserId(userId);
      try {
        if (isAdmin) {
          const response = await fetch(`http://localhost:4000/adminrecords?quoteType=${quoteType2}`);
          if (response.status === 200) {
            const data = await response.json();
            setRecords(data);
          } else {
            console.error('Failed to fetch records');
          }
        }
        else {
          const response = await fetch(`http://localhost:4000/records?userId=${quoteUserId}&quoteType=${quoteType2}`);
          if (response.status === 200) {
            const data = await response.json();
            setRecords(data);
          } else {
            console.error('Failed to fetch records');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchRecords();
  }, [isAdmin, quoteType2, quoteUserId, records, userId]);//new edit

  const handleAddRecord = async () => {
    console.log('User ID:', quoteUserId);

    try {
      const response = await fetch('http://localhost:4000/saverecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteUserId, name, quoteType, quoteDate, quoteCost, quoteComps }),
      });

      if (response.status === 201) {
        alert('Record saved successfully');
        setName('');
        setQuoteType('Gaming PC');
        setQuoteDate('');
        setQuoteCost(0);
        setQuoteComps([]);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save record');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true)
  }
  const handleCloseExportModal = () => {
    setShowExportModal(false);
  }

  return (
    <div className='quote-details-container'>
      <div className='quote-details-title'>
        <p>Quote Details</p>
      </div>
      <div className='quote-details-column'>
        <div className='detail-items'>
          <label htmlFor='name'> Name </label>
          <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className='search-name-date'>
          <div className='detail-items'>
            <label htmlFor='name'> Quote list </label>
            <select id='dropdown' value={quoteType} onChange={(e) => setQuoteType(e.target.value)}>
              <option value='Gaming PC'>Gaming PC</option>
              <option value='Content Creation'>Content creation and productivity</option>
              <option value='Office/Home PC'>Office/Home</option>
              <option value='Custom/Other'>Custom/Other</option>
            </select>
          </div>
          <div className='detail-items'>
            <label htmlFor='name'> Cost </label>
            <input
              type='number'
              id='quote-cost'
              value={quoteCost}
              onChange={(e) => setQuoteCost(e.target.value)}
            />
          </div>
          <div className='detail-items'>
            <label htmlFor='name'> Quote Date </label>
            <input
              type='date'
              id='quote-date'
              value={quoteDate}
              onChange={(e) => setQuoteDate(e.target.value)}
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.99 }}
          whileHover={{ scale: 1.1, backgroundColor: 'lightblue' }}
          transition={{ duration: 0.2 }}
          onClick={handleAddRecord}
          className='add-component-btn'
        >
          Add Build
        </motion.button>
      </div>
      <div className='quote-details-components'>
        <div className='quote-details-header'>
          <h4>YOUR BUILDS</h4>
          <button className='export-button' onClick={handleExportClick}>Export<ArrowUpwardIcon fontSize='small' /></button>
        </div>

        <select id='dropdown2' className='builds-filter' value={quoteType2} onChange={(e) => setQuoteType2(e.target.value)}>
          <option value='choosequote2'>Choose quote type</option>
          <option value='Gaming PC'>Gaming PC</option>
          <option value='Content Creation'>Content creation and productivity</option>
          <option value='Office/Home PC'>Office/Home</option>
          <option value='Custom/Other'>Custom/Other</option>
        </select>
        <div className='quote-details-list-container'>
          {records.map((record) => (
            <motion.div
              key={record._id}
              className='component-list'
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.2 }}
            >
              <ComponentCard title={record.name} cost={record.quoteCost} id={record._id} comps={record.quoteComps} type={record.quoteType} ></ComponentCard>
            </motion.div>
          ))}
        </div>
      </div>
      <ExportQuotesModal show={showExportModal} onHide={handleCloseExportModal} />
    </div>
  );
};

export default QuoteDetails;

