// @ts-nocheck
const serverSocket = io('http://localhost:8080');

const button = document.querySelector('#btnEnviar')

/*
serverSocket.on("algoEnFormatoSerializable", datosAdjuntos => {
    console.log("mensaje enviado desde server...")
    console.log("datosAdjuntos", datosAdjuntos)
})

serverSocket.on("alertaaa",datosAdjuntos => {
    alert(datosAdjuntos)
} )

*/


Swal.fire({
    title: "Identificate",
    input: "text",
    inputValidator: (value)=>{
        return !value && "Nesecitas escribir un nombre de usuario para comenzar a chatear!"
    },
    allowOutsideClick: false
}).then(result=>{
    const inputAutor = document.querySelector('#inputAutor')
    if (!(inputAutor instanceof HTMLInputElement)) return
    inputAutor.value = result.value
    serverSocket.emit('nuevoUsuario',inputAutor.value)
})

if (button){
    button.addEventListener ('click', evento => {
        //serverSocket.emit("mensajeCliente", {datos: [1,2,3]})
        console.log("ENVIANDO MENSAJE A SERVER")
        const inputAutor = document.querySelector('#inputAutor')
        const inputMensaje = document.querySelector('#inputMensaje')

        if (!(inputAutor instanceof HTMLInputElement) || !(inputMensaje instanceof HTMLInputElement)) return

        const autor = inputAutor.value
        const mensaje = inputMensaje.value

        if(!autor || !mensaje) return

        const emitMsj =  { fecha: Date.now(), autor, mensaje}
        serverSocket.emit('nuevoMensaje',emitMsj)
    })
}


const plantillaMensajes = `
{{#if hayMensajes }}
<ul>
    {{#each mensajes}}
    <li>({{this.fecha}}) {{this.autor}}: {{this.mensaje}}</li>
    {{/each}}
</ul>
{{else}}
<p>no hay mensajes...</p>
{{/if}}
`

const armarHtml = Handlebars.compile(plantillaMensajes)

serverSocket.on('actualizarMensajes', mensajes => {
    const divMensajes = document.getElementById("mensajes")
    if(divMensajes){
        divMensajes.innerHTML = armarHtml({mensajes, hayMensajes: mensajes.length > 0 })
    }
})

serverSocket.on('nuevoUsuario', nombreUsuario => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer:2000,
        title:`${nombreUsuario} se unio al chat`,
        icon: 'success'
    })

})


