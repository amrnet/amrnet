import { menuItems } from '../../../util/menuItems';

export const MenuHead = () => {
    return (
        <div style={{ display: 'flex' }}>
            {menuItems.map((item, index) => (
                <div key={index} style={{ padding: '10px',  backgroundColor: 'cyan', alignItems: 'center', backgroundColor: 'yellow'}}>
                    <a href={item.link} style={{ textDecoration: 'none', color: 'black' }}>
                        {item.label}
                    </a>
                </div>
            ))}
        </div>
    );
};
