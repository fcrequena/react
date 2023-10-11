import {AuthContext } from '../context/authContext'
import { useContext, useState } from "react";
import { Alert, Autocomplete, Box, Button, Container, Grid, Modal, Stack, TextField } from "@mui/material"

import * as React from 'react';
import Divider from '@mui/material/Divider';

import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import SpanningTable from '../components/tableDiary';
import { styleModal, Item } from '../components/modal';
import { useMutation } from '@apollo/react-hooks';
import { GET_POINT_SALE_USER } from '../gql/mutation';
import MyTitle from '../components/title';

const theme = createTheme();
const useStyles = makeStyles((theme) => (styleModal));

function Diary(){
    const context = useContext(AuthContext);
    const classes = useStyles();
    const [ errors, setErrors ] = useState([]);
    const [ pointSaleData, setPointSaleData ] = useState([]);
    const [ pointSaleSelected, setPointSaleSelected ] = useState(null);
    const [ productPointSale, setProductPointSale ] = useState([]);
    const [ productSeleccionado, setProductoSeleccionado ] = useState({
        cantidad: '',
        describe: '',
        producto: ''
    });
    const [ modalCreate, setModalCreate ] = useState(false);

    const { user, logout} = useContext(AuthContext);

    const handleChange = e => {
        const {name, value } = e.target;
        setProductoSeleccionado(prevState => ({
            ...prevState,
            [name]: value
        }))
    };

    console.log({productSeleccionado})
    const openCloseModalCreate=()=>{
        setModalCreate(!modalCreate);
        console.log('redireccionar')
    }

    const loadingDataPointSale = () => {
        const newArray = pointSaleData.find((datos) => datos.codigo === pointSaleSelected.codigo)
        setProductPointSale(newArray);
        setModalCreate(!modalCreate);
    }

    const funSelectPointSale = () => {
        selectPointSale();
        
    }
    /*****MUTATION */
    const [ selectPointSale, { selectPointSaleLoading }] = useMutation(GET_POINT_SALE_USER,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: { codigo: user.codigo},
        onCompleted: (data) => {
            setPointSaleData(data.getPointSaleById);
            setModalCreate(true);
        }
    })

    const defaultPropsPointSale = {
        options: pointSaleData,
        getOptionLabel: (option) => option.nombre,
    };

    const defaultPropsProduct = {
        options: productPointSale.productos,
        getOptionLabel: (option) => option.nombre,
    };


    const bodyCreate=(
        <div className={classes.modal}>
            <h3>Seleccione Punto de venta</h3>
            <Autocomplete
                {...defaultPropsPointSale}
                id="punto_venta"
                name="punto_venta"
                clearOnEscape
                value={pointSaleSelected}
                onChange={(event, newValue) => {
                    setPointSaleSelected(newValue);
                    
                    setProductoSeleccionado(prevState=>({
                        ...prevState,
                        "punto_venta": newValue.codigo
                    }));
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Punto de venta" />
                    )}
                    />
            <br/>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalCreate} color="error">Cerrar</Button>
                    <Button variant="contained" onClick={loadingDataPointSale} color="primary">Seleccionar</Button>
                </Stack>
                {errors?.map(function(error){
                    return(
                        <Alert severity="error">
                        {error}
                    </Alert>
                )
            })}
            </div>
        </div>
        
    )

    React.useEffect(() => {
        funSelectPointSale();
    }, [])
    
    return (
    <ThemeProvider theme={theme}>

        <Container spacing={2} maxWidth="lg">
            <MyTitle titulo={'Registro diario de ' +productPointSale.nombre}></MyTitle>

            <Grid container direction="row"
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={1}>
                <Grid item xs={2}>
                    <Item style={{ height: 80 }} >
                        <TextField 
                            type="number"
                            inputProps={{ step: '0.01' }}
                            name="cantidad" 
                            label="Cantidad" 
                            onChange={handleChange}
                            /> 
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Item style={{ height: 80 }}>
                        <Autocomplete
                            {...defaultPropsProduct}
                            id="productoo"
                            name="producto"
                            clearOnEscape
                            // value={tipoSeleccionado}
                            onChange={(event, newValue) => {
                                // setTipoSeleccionado(newValue);
                                setProductoSeleccionado(prevState=>({
                                    ...prevState,
                                    "producto": newValue.codigo
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccione un producto" />
                            )}
                            />
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Item style={{ height: 80 }}>
                        <TextField multiline={true}
                        fullWidth
                            type="text"
                            name="Descripcion" 
                            label="Descripcion" 
                            helperText="Descripción si es otros ingresos u otros egresos."
                            onChange={handleChange}
                            /> 
                    </Item>

                </Grid>
                <Grid item xs="auto">
                    <Item style={{ height: 80, alignItems: "center", display: "flex"}}>
                        <Button variant="contained" color="success">Agregar</Button>
                    </Item>

                </Grid>
            </Grid>

                    
        </Container>

        <Modal
            open={modalCreate}
            onClose={openCloseModalCreate}>
            {bodyCreate}
        </Modal>
            
    </ThemeProvider>
    )
    
}

export default Diary;
