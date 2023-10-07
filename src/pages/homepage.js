import {AuthContext } from '../context/authContext'
import { useContext } from "react";
import { Container, Stack } from "@mui/material"
function Homepage(){
    const { user, logout} = useContext(AuthContext);

    return (
            <>
            <Container spacing={2} maxWidth="sm">
                <h1>Bienvenido</h1>
                <Stack spacing={2} padding={2}>
                {
                    user 
                    ?
                    <>
                        <p>
                            {user.userId} has iniciado sesión
                        </p>
                    </>
                    :
                    <>
                        <p>Inicia sesión</p>
                    </>
                }                    
                </Stack>
            </Container>
            </>
        )
    
}

export default Homepage;
