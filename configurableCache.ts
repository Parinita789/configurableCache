interface Icache {
    write(key: string, value: string): void;
    read(key: string): string | undefined;
}

enum CacheType {
    LRU,
    LFU
}

class DLLNode {
    public key: string;
    public value: string;
    public prev: DLLNode | null;
    public next: DLLNode | null;
    constructor(key: string, value: string, next: DLLNode | null= null, prev: DLLNode | null = null) {
        this.key = key;
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}

class LRU implements Icache {
    private size: number;
    private limit: number;
    private head: DLLNode | null;
    private tail: DLLNode | null;
    private cacheMap: Map<string, DLLNode>;

    constructor(limit: number) {
        this.size = 0;
        this.limit = limit;
        this.head = null;
        this.tail = null;
        this.cacheMap = new Map();
    }

    public write(key: string, value: string): void {

        let existingNode = this.cacheMap.get(key);
        if (existingNode) {
            this.detach(existingNode);
            this.size--;
        } else if (this.size === this.limit) {
            this.cacheMap.delete(this.tail!.key);
            this.detach(this.tail);
            this.size--;
        }

        if (!this.head) {
            this.head = this.tail = new DLLNode(key, value);
        } else {
            // attach the node at the head
            let node = new DLLNode(key, value, this.head);
            this.head.prev = node;
            this.head = node;
        }

        this.cacheMap.set(key, this.head);
        this.size++;
    }

    public read(key: string): string | undefined {
        let existingNode = this.cacheMap.get(key);
        if (existingNode) {
            const value = existingNode.value;
            if (this.head !== existingNode) {
                this.write(key, value)
            }
            return value;
        }
    }

    private detach(node: DLLNode | null): void {
        if (node!.prev !== null) {
            node!.prev!.next = node!.next;
        } else {
            this.head = node!.next
        }

        if (node!.next !== null) {
            node!.next!.prev = node!.prev;
        } else {
            this.tail = node!.prev;
        }
    }

    private print(): void{
        let node = this.head;
        while (node) {
            console.log(node.key)
            node = node.next;
        }
    }
}

class LFU implements Icache{
    private limit: number
    constructor(limit: number) {
        this.limit = limit;
    }
    public read(key: string): string { 
        return ''
    }

    public write (key: string, value: string): void {

    }

    public detach (node: DLLNode): void {

    }

    public print (): void {

    }
}

class CacheFactory {
    public static configureCache(cacheType: CacheType, limit: number): Icache {
        switch(cacheType) {
            case CacheType.LFU:
                return new LFU(limit)
            case  CacheType.LRU:
                return new LRU(limit) 
        }
    }
}

const cache = CacheFactory.configureCache(CacheType.LRU, 3);

cache.write('a', '123');
cache.write('b', '456');
cache.write('c', '789'); 
cache.read('a'); // lru is 'b'
cache.write('d', '0'); // lru 'b' is removed