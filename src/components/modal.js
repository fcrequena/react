import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

export const styleModal = {
    modal: {
      position: 'absolute',
      width: 400,
      backgroundColor: '#ffffff',
      border: '2px solid #000',
      boxShadow: '15px 15px #888888',
      padding: '15px 20px 25px 15px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    iconos:{
        cursor: 'pointer'
    },
    inputMaterial:{       
        width:'100%'
    }
} 

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));