using be.wl as my from '../db/data-model';


service CatalogService {
    entity Faces as projection on my.Faces;
}
