import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
        flex: 1,
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
        marginBottom: 10
    },
    textButton: {
        color: '#fff'
    },
    userdata: {
        marginBottom: 20
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
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingTop: 70
    },
    scroll: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input_description: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '60%',
        marginBottom: 20,
        paddingLeft: 10,
        borderRadius: 10,
        color: 'black'
    },
    scroll_profile: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default styles;