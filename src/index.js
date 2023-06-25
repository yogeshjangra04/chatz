import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import ChatProvider from './context/chatProvider';

//states inside context api are available to all components
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <BrowserRouter>
    <ChatProvider>
      <ChakraProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ChakraProvider>
    </ChatProvider>
  </BrowserRouter>


);



