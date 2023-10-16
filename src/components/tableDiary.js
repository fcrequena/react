import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableViewOutlined } from '@mui/icons-material';

const TAX_RATE = 0.07;

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const rows = [
  createRow('Paperclips (Box)', 100, 1.15),
  createRow('Paper (Case)', 10, 45.99),
  createRow('Waste Basket', 2, 17.99),
];

const invoiceSubtotal = subtotal(rows);
const invoiceTaxes = TAX_RATE * invoiceSubtotal;
const invoiceTotal = invoiceTaxes + invoiceSubtotal;

export default function SpanningTable(props) {
  const { datos } = props;
  console.log({datos: datos[0].tipo_producto})
  const [ tipo, setTipo ] = React.useState([]);
  const [ producto, setProducto ] = React.useState([]);

  
  React.useEffect(() => {
    console.log("pancho tabla")
    setTipo(datos[0].tipo_producto);
  },[])

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={4}>
              Reporte Mensual 
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              Comunidad:
            </TableCell>
            <TableCell align="center" colSpan={2}>
              Nombre del punto de venta
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              Mes de: 
            </TableCell>
            <TableCell align="center" colSpan={2}>
                NOmbre del mes
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">Personas</TableCell>
            <TableCell align="center">Cantidad</TableCell>
            <TableCell align="center">Descripcion</TableCell>
            <TableCell align="center">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          
          {tipo.map((row) => (
            <TableRow key={row.codigo}>
              <TableCell align="center">{}</TableCell>
              <TableCell align="center">{}</TableCell>
              <TableCell align="left">{row.nombre}</TableCell>
              <TableCell align="center">{}</TableCell>
            </TableRow> 
          ))}
          
          <TableRow key={1}>
              <TableCell>{"Columna 1" }</TableCell>
                <TableCell>{"Columna 2" }</TableCell>
                <TableCell>{"Columna 2" }</TableCell>
                <TableCell>{"Columna 2" }</TableCell>
            </TableRow>
          


          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={2}>Subtotal</TableCell>
            <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax</TableCell>
            <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
            <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}