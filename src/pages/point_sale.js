import { useContext, useState } from "react";
import {AuthContext } from '../context/authContext'
import { useMutation, useQuery } from "@apollo/react-hooks";

import { TextField, Button, Container, Stack, Alert,
            Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Tab,
            Modal, Autocomplete, 
            Accordion, AccordionSummary, AccordionDetails
    } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import {Edit, Delete } from '@mui/icons-material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { gql } from 'graphql-tag';
import { useNavigate } from "react-router-dom";
import MyTitle from "../components/title";

import { Fragment } from "react";

import { CREATE_POINT_SALE, EDIT_POINT_SALE, DELETE_POINT_SALE, CREATE_POINT_PRODUCTO } from "../gql/mutation";
import { GET_ALL_POINT_SALE, GET_ALL_PRODUCT } from "../gql/query";

/* CONSULTAS DE GRAPHQL */
const theme = createTheme();

/* ESTILOS MODAL */
const useStyles = makeStyles((theme) => ({
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
        padding: '2px',
        width:'100%'
    }
}));


function PointSale(props){

    const context = useContext(AuthContext)
    const classes = useStyles();
    let navigate = useNavigate();
    const [ errors, setErrors] = useState([]);
    const [ title, setTitle ] = useState("Punto de venta")
    const [ pointSaleData, setPointSaleData ] = useState([]);
    const [ allProductData, setAllProductData ] = useState([]);
    const [ modalCreate, setModalCreate ] = useState(false);
    const [ modalEdit, setModalEdit ] = useState(false);
    const [ modalDelete, setModalDelete ] = useState(false);
    const [ modalAdd, setModalAdd ] = useState(false);
    const [ productoSeleccionado, setProductoSeleccionado ] = useState({
        nombre: '',
        descripcion: ''
    })
    const [ tipoSeleccionado, setTipoSeleccionado ] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const handleChange = e => {
        const { name, value } = e.target;
        setProductoSeleccionado(prevState=>({
            ...prevState,
            [name]: value
        }))
    }
    //---------------------------------------------
    const {loading, error, data} = useQuery(GET_ALL_POINT_SALE,{
        onError({ graphQLErrors }){
            console.log({graphQLErrors})
            setErrors(graphQLErrors);
        },
        onCompleted: (queryData) =>{
            const productArray = queryData.getAllPointSale;
            
            setPointSaleData(productArray);
        }
    });

    const {typeLoading, typeError, typeData} = useQuery(GET_ALL_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        onCompleted: (queryData) =>{
            const productArray = queryData.getAllProduct;
            setAllProductData(productArray);
        }
    });

    //Mutaciones ------------------------------------------------------------------------
    function funCreateProducto()
    {
        createProducto();           
    }

    const [createProducto, { createLoading }] = useMutation(CREATE_POINT_SALE,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion} ,
        onCompleted: (data) => {
            setPointSaleData(pointSaleData.concat(data.createPointSale));
            openCloseModalCreate();
        }
    });

    function funEditProducto()
    {
        editProducto();           
    }

    const [editProducto, { editLoading }] = useMutation(EDIT_POINT_SALE,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo,
                    nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion} ,
        onCompleted: (data) => {
                var newData = [...pointSaleData];
                var editado = data.updatePointSale;
                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];
                    setPointSaleData(nuevoArray.concat(editado));
                //setPointSaleData(nuevoArray);
                openCloseModalEdit();
        }
    });


    function funDeleteProducto()
    {
        deleteProducto();           
    }

    const [deleteProducto, { deleteLoading }] = useMutation(DELETE_POINT_SALE,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo} ,
        onCompleted: (data) => {
                var newData = [...pointSaleData];
                var editado = data.deletePointSaleById;
                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];

                    setPointSaleData(nuevoArray.concat(editado));
                openCloseModalDelete();
        }
    });

    function funAddPProducto(){
        console.log(productoSeleccionado)
        addPProducto();
    }

    const [ addPProducto, { addPPLoading}] =useMutation(CREATE_POINT_PRODUCTO,{
        onError({graphQLErrors}){
            setErrors(graphQLErrors);
        },
        variables:{codigo_producto: productoSeleccionado.producto,
                     codigo_punto_venta: productoSeleccionado.codigo,
                    precio: parseFloat(productoSeleccionado.precio)},
        onCompleted: (data) => {
            openCloseModalAdd();
        }
    })
    /**Errores GQL ------------------------------------------------------------------- */
    if (loading) return null;
    if (error) {
        let isArray = Array.isArray(error);
        // if(!isArray){
        //     navigate('/');
        //     return;
        // }
        console.log({error})
        setErrors(error);
    }
    
    if (typeLoading) return null;
    if (typeError) setErrors(typeError);

    //Modales--------------------------------------------------------------------------
    const openCloseModalCreate=()=>{
        setModalCreate(!modalCreate);
    }

    const openCloseModalEdit=()=>{
        setTipoSeleccionado(null);
        setModalEdit(!modalEdit);
    }

    const openCloseModalDelete=()=>{
        setTipoSeleccionado(null);
        setModalDelete(!modalDelete);
    }

    const openCloseModalAdd=()=>{
        setTipoSeleccionado(null);
        setModalAdd(!modalAdd);
    }

    const seleccionarProducto=(producto, caso)=>{
        let tipo = allProductData.find((valor)=> valor.codigo === producto.producto);
       
        setTipoSeleccionado(tipo);
        setProductoSeleccionado(producto);
        if (caso == 'Editar') {
            setModalEdit(true)
        }  else if (caso == 'Editar'){
            setModalDelete(true)
        } else{
            setModalAdd(true)
        }
    }

    //--------------------------------------------------------
    const defaultProps = {
        options: allProductData,
        getOptionLabel: (option) => option.nombre,
    };

    const bodyCreate=(
        <div className={classes.modal}>
            <h3>Crear {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange}/> <br/>

            <br/>
            <br/>
            <div align="right">
                <Button onClick={funCreateProducto} color="primary">Crear</Button>
                <Button onClick={openCloseModalCreate}>Cerrar</Button>

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

    const bodyEdit=(
        <div className={classes.modal}>
            <h3>Editar {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.nombre}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.descripcion}/> <br/>

            <br/>
            <br/>
            <div align="right">
                <Button onClick={funEditProducto} color="primary">Editar</Button>
                <Button onClick={openCloseModalEdit}>Cerrar</Button>
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

    const bodyDelete=(
        <div className={classes.modal}>
            <h3>Eliminar {title}</h3>
            <p>Está seguro de Eliminar este producto {productoSeleccionado && productoSeleccionado.nombre}?</p>
            <div align="right">
                <Button onClick={funDeleteProducto} color="primary">Sí</Button>
                <Button onClick={openCloseModalDelete}>No</Button>
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

    const bodyAdd=(
        <div className={classes.modal}>
            <h3>Agregar producto a {title}</h3>
            <Autocomplete
                {...defaultProps}
                id="producto"
                name="producto"
                clearOnEscape
                value={tipoSeleccionado}
                //onChange={handleChange}
                onChange={(event, newValue) => {
                    setTipoSeleccionado(newValue);
                    setProductoSeleccionado(prevState=>({
                        ...prevState,
                        "producto": newValue.codigo
                    }));
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Tipo de producto" />
                )}
            />
            <br/>
            <TextField 
                type="number"
                inputProps={{ step: '0.01' }}
                name="precio" 
                className={classes.inputMaterial} 
                label="Precio" 
                onChange={handleChange} 
                
            /> <br/>
            <br/>
            <br/>
            <div align="right">
                <Button onClick={funAddPProducto} color="primary">Agregar</Button>  
                <Button onClick={openCloseModalAdd}>Cerrar</Button>
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

    const miBoton = (
        <Button variant="contained" color="success" onClick={openCloseModalCreate}>Nuevo</Button>
      );

      

      // Función para manejar la expansión/colapso de una fila
      const handleExpandRow = (rowIndex) => {
        if (rowIndex === expandedRow) {
          setExpandedRow(null); // Colapsar si ya está expandida
        } else {
          setExpandedRow(rowIndex); // Expandir si no está expandida
        }
      };

    return (
    <ThemeProvider theme={theme}>
        {/* <div className="App"> */}
        <div> 
        <Container spacing={4} maxWidth="md">
        <MyTitle titulo={title} boton={miBoton}></MyTitle>
            <br/>
            <br/>
            {/* <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pointSaleData.map(console=>(
                            <TableRow key={console.codigo}>
                                <TableCell>{console.nombre}</TableCell>
                                <TableCell>{console.descripcion}</TableCell>
                                <TableCell>{console.activo == true ? "Activo" : "Inactivo"}</TableCell>
                                <TableCell>
                                    <Edit className="{styles.iconos}" onClick={() => seleccionarProducto(console, 'Editar')} />
                                    &nbsp;&nbsp;&nbsp;
                                    <Delete className="{styles.iconos}" onClick={() => seleccionarProducto(console, 'Eliminar')} />        
                                    &nbsp;&nbsp;&nbsp;
                                    <LibraryAddIcon className="{styles.iconos}" onClick={()=> seleccionarProducto(console, 'Agregar')}></LibraryAddIcon>
                                </TableCell>
                            
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer> */}
           
           <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Productos</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pointSaleData.map((row, index) => (
            <Fragment key={row.codigo}>
              <TableRow>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.descripcion}</TableCell>
                <TableCell>{row.activo == true ? "Activo" : "Inactivo"}</TableCell>

                <TableCell>
                  <Accordion  color="primary" variant="outlined"
                    expanded={index === expandedRow}
                    onChange={() => handleExpandRow(index)}
                  >
                    <AccordionSummary >Productos asociados</AccordionSummary>
                    <AccordionDetails>
                        <Table >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>precio</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.productos.map((descripcion, descIndex) => (
                                    <>
                                        <TableRow>
                                            <TableCell>{descripcion.nombre}</TableCell>
                                            <TableCell>{descripcion.precio}</TableCell>
                                        </TableRow>
                                        {/* {descIndex < row.productos.length - 1 && <hr />}  */}
                                        {/* Línea divisoria */}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                  </Accordion>
                </TableCell>
                <TableCell>
                    <Edit className="{styles.iconos}" onClick={() => seleccionarProducto(row, 'Editar')} />
                    &nbsp;&nbsp;&nbsp;
                    <Delete className="{styles.iconos}" onClick={() => seleccionarProducto(row, 'Eliminar')} />        
                    &nbsp;&nbsp;&nbsp;
                    <LibraryAddIcon className="{styles.iconos}" onClick={()=> seleccionarProducto(row, 'Agregar')}></LibraryAddIcon>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
           


            </Container>
        
            <Modal
                open={modalCreate}
                onClose={openCloseModalCreate}>
                {bodyCreate}
            </Modal>

            <Modal
                open={modalEdit}
                onClose={openCloseModalEdit}>
                {bodyEdit}
            </Modal>
    
            <Modal
                open={modalDelete}
                onClose={openCloseModalDelete}>
                {bodyDelete}
            </Modal>

            <Modal
                open={modalAdd}
                onClose={openCloseModalAdd}>
                {bodyAdd}
            </Modal>
        </div>
    </ThemeProvider>
    )

}



export default PointSale;