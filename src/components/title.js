import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

function MyTitle(props) {
    const { titulo, boton } = props;

  return (
    <div>
        <br/>
      <Grid container  
      direction="row"
      justifyContent="space-between"
      alignItems="flex-end">
        <Grid item xs={8}>
          <Typography variant="h4" gutterBottom>
          {titulo}
          </Typography>
        </Grid>
        <Grid item xs={4} alignItems="tight">
          <Button >
            {boton}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default MyTitle;
