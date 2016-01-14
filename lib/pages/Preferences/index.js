import React    from 'react';
import { Link } from 'react-router';
import style    from  './style.mcss';

const prefList = (<div className={style.center}>
        <section className={style.linkSection}>
            <Link className={style.link} to='/Preferences/User'>User</Link>
            <Link className={style.link} to='/Preferences/Cluster'>Cluster</Link>
        </section>
        <section className={style.linkSection}>
            <Link className={style.link} to='/Preferences/AWS'>AWS</Link>
            <Link className={style.link} to='/Preferences/OpenStack'>OpenStack</Link>
        </section>
    </div>);

export default React.createClass({

    displayName: 'Preferences',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        location: React.PropTypes.object,
    },

    render() {
        const children = this.props.children || prefList;
        return <div>
            <nav className={style.preferencesToolbar}>
                <Link to='/Preferences'><i className="fa fa-th"></i></Link>
                { this.props.location.pathname.split('/').pop() }
            </nav>
            { children }
        </div>;
    },
});
