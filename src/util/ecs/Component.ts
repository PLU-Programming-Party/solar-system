/**
 * The Component class is the base class for all components.
 * Components are containers for data, and should contain no 
 * logic. While multiple entities can share the same component,
 * there should only be one instance of each component at a 
 * time. Data in components should be stored in lists, where the
 * index of the list corresponds to the entity ID.
 * 
 */
abstract class Component{
    _size: number;
    _ids: number[] = [];

    constructor(entity_id: number){
        this._ids.push(entity_id);
        this._size = this._ids.length;
    }

    _getData(entity_id: number): any{
        return null;
    }

    _setData(entity_id: number, data: any): void{
        return;
    }
}

export default Component;