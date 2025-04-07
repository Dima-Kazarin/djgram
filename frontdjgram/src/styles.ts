import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 25,
        paddingLeft: 10,
        paddingTop: 7,
    },
    line: {
        backgroundColor: 'black',
        fontSize: 0.5,
        marginTop: 10
    },
    line_bottom: {
        backgroundColor: 'black',
        fontSize: 0.5,
        top: '82%'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '60%',
        marginBottom: 20,
        paddingLeft: 10,
        borderRadius: 10,
        color: 'black'
    },
    form: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    buttons_log: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        width: 70,
        height: 30,
        borderRadius: 20,
        marginBottom: 10,
    },
    buttons_logout: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        width: 70,
        height: 30,
        borderRadius: 20,
        marginBottom: 10,
        left: '65%'
    },
    textButton: {
        color: '#fff'
    },
    userdata: {
        marginBottom: 20,
        marginRight: '50%'
    },
    button_home: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 20,
        padding: 5,
        width: 20
    },
    button_add: {
        width: 20,
        position: 'absolute',
        bottom: 20,
        left: '48%',
        right: 20,
        padding: 5,
        paddingRight: 10,
        alignItems: 'center'
    },
    button_profile: {
        width: 20,
        position: 'absolute',
        bottom: 20,
        right: 40,
        padding: 5
    },
    navigation_buttons: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingTop: 70,
        position: 'absolute',
        alignItems: 'flex-end',
        justifyContent: 'center',
        bottom: 40,
        left: 0,
        right: 0,
    },
    scroll: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    input_description: {
        height: 100,
        textAlignVertical: 'top',
        width: '100%',
        marginTop: 20,
        paddingLeft: 10,
        color: 'black',
    },
    scroll_profile: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    add_post_button: {
        alignItems: 'center',
        width: '90%',
        padding: 10,
        marginTop: 20,
        backgroundColor: 'blue',
        borderRadius: 10,
        position: 'absolute',
        bottom: 20,
        left: '5%'
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
    direct_button: {
        paddingLeft: '63%',
        top: 12,
        width: 10
    },
    back_button: {
        top: 12
    },
    subscribe_button: {
        width: '90%', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'blue',
        height: 30,
        borderRadius: 20
    },
})

export default styles;