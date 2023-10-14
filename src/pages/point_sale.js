import { useContext, useState } from "react";
import {AuthContext } from '../context/authContext'
import { useMutation, useQuery } from "@apollo/react-hooks";

import { TextField, Button, Container, Stack, Alert,
            Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Tab,
            Modal, Autocomplete, 
            Accordion, AccordionSummary, AccordionDetails,TablePagination
    } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import AddIcon from '@mui/icons-material/Add';
import {Edit, Delete } from '@mui/icons-material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

import { useNavigate } from "react-router-dom";
import MyTitle from "../components/title";

import { Fragment } from "react";

import { CREATE_POINT_SALE, EDIT_POINT_SALE, DELETE_POINT_SALE, CREATE_POINT_PRODUCTO } from "../gql/mutation";
import { GET_ALL_POINT_SALE, GET_ALL_PRODUCT } from "../gql/query";
import { styleModal } from "../components/modal";
/* CONSULTAS DE GRAPHQL */
const theme = createTheme();

/* ESTILOS MODAL */
const useStyles = makeStyles((theme) => (styleModal));


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
    const [filtro, setFiltro] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
            // console.log({graphQLErrors})
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
        // console.log(productoSeleccionado)
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
        if(!isArray){
            navigate('/');
            return;
        }
        // console.log({error})
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
        }  else if (caso == 'Eliminar'){
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
            <Stack direction="row" spacing={2} justifyContent="flex-end">

                <Button variant="contained" onClick={openCloseModalCreate} color="error">Cerrar</Button>
                <Button variant="contained" onClick={funCreateProducto} color="primary">Crear</Button>
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

    const bodyEdit=(
        <div className={classes.modal}>
            <h3>Editar {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.nombre}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.descripcion}/> <br/>

            <br/>
            <br/>
            <div align="right">
            <Stack direction="row" spacing={2} justifyContent="flex-end">

                <Button variant="contained" onClick={openCloseModalEdit} color="error">Cerrar</Button>
                <Button variant="contained" onClick={funEditProducto} color="primary">Editar</Button>
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

    const bodyDelete=(
        <div className={classes.modal}>
            <h3>Eliminar {title}</h3>
            <p>Está seguro de Eliminar este producto {productoSeleccionado && productoSeleccionado.nombre}?</p>
            <div align="right">
            <Stack direction="row" spacing={2} justifyContent="flex-end">

                <Button variant="contained" onClick={openCloseModalDelete}>No</Button>
                <Button variant="contained" onClick={funDeleteProducto} color="primary">Sí</Button>
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
                    if(newValue !== null){
                        setTipoSeleccionado(newValue);
                        setProductoSeleccionado(prevState=>({
                            ...prevState,
                            "producto": newValue.codigo
                        }));
                    }   
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
            <Stack direction="row" spacing={2} justifyContent="flex-end">

                <Button variant="contained" onClick={openCloseModalAdd} color="error">Cerrar</Button>
                <Button variant="contained" onClick={funAddPProducto} color="primary">Agregar</Button>  
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

    /**FUNCION DE LA TABLA-------------------------------------------------------------- */
    // Función para manejar la expansión/colapso de una fila
    const handleExpandRow = (rowIndex) => {
        if (rowIndex === expandedRow) {
            setExpandedRow(null); // Colapsar si ya está expandida
        } else {
            setExpandedRow(rowIndex); // Expandir si no está expandida
        }
    };
    
    // Función para manejar cambios en el campo de búsqueda
    const handleFiltroChange = (event) => {
        setFiltro(event.target.value);
    };
    
    // Filtrar los datos basados en el filtro de búsqueda
    const datosFiltrados = pointSaleData.filter((dato) =>
        dato.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
    
    const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    };

    /**mis BOTONES -------------------------------------------------------------------- */
    const miBoton = (
        <Button variant="contained" color="success" onClick={openCloseModalCreate}>Nuevo</Button>
      );

    const miFiltro = (
        <TextField label="Buscar por nombre" value={filtro} onChange={handleFiltroChange} />
    );

    return (
    <ThemeProvider theme={theme}>
        <div> 
        <Container spacing={6} maxWidth="md">
            <MyTitle titulo={title} boton={miBoton} buscar={miFiltro}></MyTitle>
            <TableContainer >
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
                {datosFiltrados
                .sort((x, y) => x.codigo - y.codigo)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
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
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={datosFiltrados.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
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