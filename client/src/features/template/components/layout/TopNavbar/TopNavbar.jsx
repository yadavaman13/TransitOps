// client/src/features/template/components/layout/TopNavbar/TopNavbar.jsx
import React from 'react';
import './TopNavbar.scss';

/**
 * TopNavbar — sticky top bar for authenticated pages.
 *
 * @param {string}          title   - Page title shown on left
 * @param {object}          user    - { name } for avatar letter
 * @param {React.ReactNode} actions - Custom nodes on the right side
 */
const TopNavbar = ({ title, user, actions }) => {
    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <header className="t-topnavbar" role="banner">
            <div className="t-topnavbar__left">
                {title && <h1 className="t-topnavbar__title">{title}</h1>}
            </div>
            <div className="t-topnavbar__right">
                {actions}
                {user && (
                    <div
                        className="t-topnavbar__avatar"
                        title={user.name}
                        aria-label={`Logged in as ${user.name}`}
                    >
                        {avatarLetter}
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopNavbar;
