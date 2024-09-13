import { menuItems } from '../../../util/menuItems';

export const MenuHead = () => {
    menuItems.map((item) => console.log(item.label));

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            AMRNET
        </div>
    );
};
