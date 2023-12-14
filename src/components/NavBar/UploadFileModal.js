import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import uploadImg from '../../assets/upload.png';
import ShowCSVdata from './ShowCSVdata';
import CloseIcon from '@mui/icons-material/Close';
import './NavBar.css';

const UploadFileModal = ({ show, onHide }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showCSVdataModal, setShowCSVdataModal] = useState(false);
    const [jsonData, setJsonData] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const handleUpload = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvData = event.target.result;
                const parsedJsonData = convertCSVToJson(csvData);
                setJsonData(parsedJsonData);
                setShowCSVdataModal(true);
            };
            reader.onerror = (error) => {
                console.error('Error reading the file:', error);
                // Handle error, e.g., show an error message to the user
            };
            reader.readAsText(selectedFile);
        }
        onHide();
    };

    const convertCSVToJson = (csvData) => {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
    
        // Define regex patterns for each key
        const patterns = {
            componentCategory: /category|type/i, // Match 'category' or 'type'
            componentName: /name/i, // Match 'name'
            componentDate: /date/i, // Match 'date'
            componentCost: /cost|price/i, // Match 'cost' or 'price'
            componentUrl: /url|link/i // Match 'url' or 'link'
        };
    
        const jsonObjects = [];
    
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            const jsonObject = {};
    
            for (let j = 0; j < headers.length; j++) {
                // Find the key that matches the regex pattern
                const key = Object.keys(patterns).find((patternKey) => patterns[patternKey].test(headers[j]));
    
                // If a matching key is found, assign the value to the corresponding property in the object
                if (key) {
                    if (key === 'componentDate') {
                        jsonObject[key] = new Date(currentLine[j]); // Convert date string to Date object
                    } else if (key === 'componentCost') {
                        jsonObject[key] = parseFloat(currentLine[j]); // Parse cost as a number
                    } else {
                        jsonObject[key] = currentLine[j]; // Assign other values directly
                    }
                }
            }
    
            jsonObjects.push(jsonObject);
        }
    
        return jsonObjects;
    };
    

    const handleOnClose = () => {
        setSelectedFile(null);
        onHide();
    };

    const handleCloseCSVModal = () => {
        setShowCSVdataModal(false);
    };

    return (
        <div>
            <Modal
                show={show}
                onHide={onHide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header className="custom-modal-header">
                    <Modal.Title id="contained-modal-title-vcenter">Upload your CSV file!</Modal.Title>
                <button className="close-button" onClick={onHide}><CloseIcon/></button>
                </Modal.Header>
                <Modal.Body className="uploadfile-box">
                    <div className="uploadfile-modalbody">
                        <div className="uploadfile-text">
                            <img src={uploadImg} alt="upload here" />
                        </div>
                        <div className="file-input-field">
                            <input type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                        <Button onClick={handleUpload} disabled={!selectedFile}>
                            Upload
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleOnClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            {jsonData && (
                <ShowCSVdata
                    show={showCSVdataModal}
                    onHide={handleCloseCSVModal}
                    data={jsonData}
                />
            )}
        </div>
    );
};

export default UploadFileModal;